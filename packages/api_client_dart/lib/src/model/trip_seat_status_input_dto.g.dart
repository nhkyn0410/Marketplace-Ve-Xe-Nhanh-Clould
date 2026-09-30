// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_seat_status_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const TripSeatStatusInputDtoStatusEnum
    _$tripSeatStatusInputDtoStatusEnum_BLOCKED =
    const TripSeatStatusInputDtoStatusEnum._('BLOCKED');
const TripSeatStatusInputDtoStatusEnum
    _$tripSeatStatusInputDtoStatusEnum_AVAILABLE =
    const TripSeatStatusInputDtoStatusEnum._('AVAILABLE');

TripSeatStatusInputDtoStatusEnum _$tripSeatStatusInputDtoStatusEnumValueOf(
    String name) {
  switch (name) {
    case 'BLOCKED':
      return _$tripSeatStatusInputDtoStatusEnum_BLOCKED;
    case 'AVAILABLE':
      return _$tripSeatStatusInputDtoStatusEnum_AVAILABLE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<TripSeatStatusInputDtoStatusEnum>
    _$tripSeatStatusInputDtoStatusEnumValues = BuiltSet<
        TripSeatStatusInputDtoStatusEnum>(const <TripSeatStatusInputDtoStatusEnum>[
  _$tripSeatStatusInputDtoStatusEnum_BLOCKED,
  _$tripSeatStatusInputDtoStatusEnum_AVAILABLE,
]);

Serializer<TripSeatStatusInputDtoStatusEnum>
    _$tripSeatStatusInputDtoStatusEnumSerializer =
    _$TripSeatStatusInputDtoStatusEnumSerializer();

class _$TripSeatStatusInputDtoStatusEnumSerializer
    implements PrimitiveSerializer<TripSeatStatusInputDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BLOCKED': 'BLOCKED',
    'AVAILABLE': 'AVAILABLE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BLOCKED': 'BLOCKED',
    'AVAILABLE': 'AVAILABLE',
  };

  @override
  final Iterable<Type> types = const <Type>[TripSeatStatusInputDtoStatusEnum];
  @override
  final String wireName = 'TripSeatStatusInputDtoStatusEnum';

  @override
  Object serialize(
          Serializers serializers, TripSeatStatusInputDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  TripSeatStatusInputDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      TripSeatStatusInputDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$TripSeatStatusInputDto extends TripSeatStatusInputDto {
  @override
  final BuiltList<String> seatCodes;
  @override
  final TripSeatStatusInputDtoStatusEnum status;
  @override
  final String? note;

  factory _$TripSeatStatusInputDto(
          [void Function(TripSeatStatusInputDtoBuilder)? updates]) =>
      (TripSeatStatusInputDtoBuilder()..update(updates))._build();

  _$TripSeatStatusInputDto._(
      {required this.seatCodes, required this.status, this.note})
      : super._();
  @override
  TripSeatStatusInputDto rebuild(
          void Function(TripSeatStatusInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TripSeatStatusInputDtoBuilder toBuilder() =>
      TripSeatStatusInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TripSeatStatusInputDto &&
        seatCodes == other.seatCodes &&
        status == other.status &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, seatCodes.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TripSeatStatusInputDto')
          ..add('seatCodes', seatCodes)
          ..add('status', status)
          ..add('note', note))
        .toString();
  }
}

class TripSeatStatusInputDtoBuilder
    implements Builder<TripSeatStatusInputDto, TripSeatStatusInputDtoBuilder> {
  _$TripSeatStatusInputDto? _$v;

  ListBuilder<String>? _seatCodes;
  ListBuilder<String> get seatCodes =>
      _$this._seatCodes ??= ListBuilder<String>();
  set seatCodes(ListBuilder<String>? seatCodes) =>
      _$this._seatCodes = seatCodes;

  TripSeatStatusInputDtoStatusEnum? _status;
  TripSeatStatusInputDtoStatusEnum? get status => _$this._status;
  set status(TripSeatStatusInputDtoStatusEnum? status) =>
      _$this._status = status;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  TripSeatStatusInputDtoBuilder() {
    TripSeatStatusInputDto._defaults(this);
  }

  TripSeatStatusInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _seatCodes = $v.seatCodes.toBuilder();
      _status = $v.status;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TripSeatStatusInputDto other) {
    _$v = other as _$TripSeatStatusInputDto;
  }

  @override
  void update(void Function(TripSeatStatusInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TripSeatStatusInputDto build() => _build();

  _$TripSeatStatusInputDto _build() {
    _$TripSeatStatusInputDto _$result;
    try {
      _$result = _$v ??
          _$TripSeatStatusInputDto._(
            seatCodes: seatCodes.build(),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'TripSeatStatusInputDto', 'status'),
            note: note,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'seatCodes';
        seatCodes.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'TripSeatStatusInputDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
