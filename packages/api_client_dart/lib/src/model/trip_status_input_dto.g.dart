// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_status_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const TripStatusInputDtoStatusEnum
    _$tripStatusInputDtoStatusEnum_OPEN_FOR_SALE =
    const TripStatusInputDtoStatusEnum._('OPEN_FOR_SALE');
const TripStatusInputDtoStatusEnum _$tripStatusInputDtoStatusEnum_LOCKED =
    const TripStatusInputDtoStatusEnum._('LOCKED');
const TripStatusInputDtoStatusEnum _$tripStatusInputDtoStatusEnum_DRAFT =
    const TripStatusInputDtoStatusEnum._('DRAFT');
const TripStatusInputDtoStatusEnum _$tripStatusInputDtoStatusEnum_CANCELLED =
    const TripStatusInputDtoStatusEnum._('CANCELLED');

TripStatusInputDtoStatusEnum _$tripStatusInputDtoStatusEnumValueOf(
    String name) {
  switch (name) {
    case 'OPEN_FOR_SALE':
      return _$tripStatusInputDtoStatusEnum_OPEN_FOR_SALE;
    case 'LOCKED':
      return _$tripStatusInputDtoStatusEnum_LOCKED;
    case 'DRAFT':
      return _$tripStatusInputDtoStatusEnum_DRAFT;
    case 'CANCELLED':
      return _$tripStatusInputDtoStatusEnum_CANCELLED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<TripStatusInputDtoStatusEnum>
    _$tripStatusInputDtoStatusEnumValues =
    BuiltSet<TripStatusInputDtoStatusEnum>(const <TripStatusInputDtoStatusEnum>[
  _$tripStatusInputDtoStatusEnum_OPEN_FOR_SALE,
  _$tripStatusInputDtoStatusEnum_LOCKED,
  _$tripStatusInputDtoStatusEnum_DRAFT,
  _$tripStatusInputDtoStatusEnum_CANCELLED,
]);

Serializer<TripStatusInputDtoStatusEnum>
    _$tripStatusInputDtoStatusEnumSerializer =
    _$TripStatusInputDtoStatusEnumSerializer();

class _$TripStatusInputDtoStatusEnumSerializer
    implements PrimitiveSerializer<TripStatusInputDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'OPEN_FOR_SALE': 'OPEN_FOR_SALE',
    'LOCKED': 'LOCKED',
    'DRAFT': 'DRAFT',
    'CANCELLED': 'CANCELLED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'OPEN_FOR_SALE': 'OPEN_FOR_SALE',
    'LOCKED': 'LOCKED',
    'DRAFT': 'DRAFT',
    'CANCELLED': 'CANCELLED',
  };

  @override
  final Iterable<Type> types = const <Type>[TripStatusInputDtoStatusEnum];
  @override
  final String wireName = 'TripStatusInputDtoStatusEnum';

  @override
  Object serialize(Serializers serializers, TripStatusInputDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  TripStatusInputDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      TripStatusInputDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$TripStatusInputDto extends TripStatusInputDto {
  @override
  final TripStatusInputDtoStatusEnum status;
  @override
  final String? reason;

  factory _$TripStatusInputDto(
          [void Function(TripStatusInputDtoBuilder)? updates]) =>
      (TripStatusInputDtoBuilder()..update(updates))._build();

  _$TripStatusInputDto._({required this.status, this.reason}) : super._();
  @override
  TripStatusInputDto rebuild(
          void Function(TripStatusInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TripStatusInputDtoBuilder toBuilder() =>
      TripStatusInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TripStatusInputDto &&
        status == other.status &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TripStatusInputDto')
          ..add('status', status)
          ..add('reason', reason))
        .toString();
  }
}

class TripStatusInputDtoBuilder
    implements Builder<TripStatusInputDto, TripStatusInputDtoBuilder> {
  _$TripStatusInputDto? _$v;

  TripStatusInputDtoStatusEnum? _status;
  TripStatusInputDtoStatusEnum? get status => _$this._status;
  set status(TripStatusInputDtoStatusEnum? status) => _$this._status = status;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  TripStatusInputDtoBuilder() {
    TripStatusInputDto._defaults(this);
  }

  TripStatusInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TripStatusInputDto other) {
    _$v = other as _$TripStatusInputDto;
  }

  @override
  void update(void Function(TripStatusInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TripStatusInputDto build() => _build();

  _$TripStatusInputDto _build() {
    final _$result = _$v ??
        _$TripStatusInputDto._(
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'TripStatusInputDto', 'status'),
          reason: reason,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
