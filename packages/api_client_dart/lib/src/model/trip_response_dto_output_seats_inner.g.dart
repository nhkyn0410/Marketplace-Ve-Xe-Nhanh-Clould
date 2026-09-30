// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_response_dto_output_seats_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const TripResponseDtoOutputSeatsInnerTypeEnum
    _$tripResponseDtoOutputSeatsInnerTypeEnum_SEAT =
    const TripResponseDtoOutputSeatsInnerTypeEnum._('SEAT');
const TripResponseDtoOutputSeatsInnerTypeEnum
    _$tripResponseDtoOutputSeatsInnerTypeEnum_BED =
    const TripResponseDtoOutputSeatsInnerTypeEnum._('BED');

TripResponseDtoOutputSeatsInnerTypeEnum
    _$tripResponseDtoOutputSeatsInnerTypeEnumValueOf(String name) {
  switch (name) {
    case 'SEAT':
      return _$tripResponseDtoOutputSeatsInnerTypeEnum_SEAT;
    case 'BED':
      return _$tripResponseDtoOutputSeatsInnerTypeEnum_BED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<TripResponseDtoOutputSeatsInnerTypeEnum>
    _$tripResponseDtoOutputSeatsInnerTypeEnumValues = BuiltSet<
        TripResponseDtoOutputSeatsInnerTypeEnum>(const <TripResponseDtoOutputSeatsInnerTypeEnum>[
  _$tripResponseDtoOutputSeatsInnerTypeEnum_SEAT,
  _$tripResponseDtoOutputSeatsInnerTypeEnum_BED,
]);

const TripResponseDtoOutputSeatsInnerStatusEnum
    _$tripResponseDtoOutputSeatsInnerStatusEnum_AVAILABLE =
    const TripResponseDtoOutputSeatsInnerStatusEnum._('AVAILABLE');
const TripResponseDtoOutputSeatsInnerStatusEnum
    _$tripResponseDtoOutputSeatsInnerStatusEnum_HOLDING =
    const TripResponseDtoOutputSeatsInnerStatusEnum._('HOLDING');
const TripResponseDtoOutputSeatsInnerStatusEnum
    _$tripResponseDtoOutputSeatsInnerStatusEnum_BOOKED =
    const TripResponseDtoOutputSeatsInnerStatusEnum._('BOOKED');
const TripResponseDtoOutputSeatsInnerStatusEnum
    _$tripResponseDtoOutputSeatsInnerStatusEnum_CHECKED_IN =
    const TripResponseDtoOutputSeatsInnerStatusEnum._('CHECKED_IN');
const TripResponseDtoOutputSeatsInnerStatusEnum
    _$tripResponseDtoOutputSeatsInnerStatusEnum_BLOCKED =
    const TripResponseDtoOutputSeatsInnerStatusEnum._('BLOCKED');

TripResponseDtoOutputSeatsInnerStatusEnum
    _$tripResponseDtoOutputSeatsInnerStatusEnumValueOf(String name) {
  switch (name) {
    case 'AVAILABLE':
      return _$tripResponseDtoOutputSeatsInnerStatusEnum_AVAILABLE;
    case 'HOLDING':
      return _$tripResponseDtoOutputSeatsInnerStatusEnum_HOLDING;
    case 'BOOKED':
      return _$tripResponseDtoOutputSeatsInnerStatusEnum_BOOKED;
    case 'CHECKED_IN':
      return _$tripResponseDtoOutputSeatsInnerStatusEnum_CHECKED_IN;
    case 'BLOCKED':
      return _$tripResponseDtoOutputSeatsInnerStatusEnum_BLOCKED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<TripResponseDtoOutputSeatsInnerStatusEnum>
    _$tripResponseDtoOutputSeatsInnerStatusEnumValues = BuiltSet<
        TripResponseDtoOutputSeatsInnerStatusEnum>(const <TripResponseDtoOutputSeatsInnerStatusEnum>[
  _$tripResponseDtoOutputSeatsInnerStatusEnum_AVAILABLE,
  _$tripResponseDtoOutputSeatsInnerStatusEnum_HOLDING,
  _$tripResponseDtoOutputSeatsInnerStatusEnum_BOOKED,
  _$tripResponseDtoOutputSeatsInnerStatusEnum_CHECKED_IN,
  _$tripResponseDtoOutputSeatsInnerStatusEnum_BLOCKED,
]);

Serializer<TripResponseDtoOutputSeatsInnerTypeEnum>
    _$tripResponseDtoOutputSeatsInnerTypeEnumSerializer =
    _$TripResponseDtoOutputSeatsInnerTypeEnumSerializer();
Serializer<TripResponseDtoOutputSeatsInnerStatusEnum>
    _$tripResponseDtoOutputSeatsInnerStatusEnumSerializer =
    _$TripResponseDtoOutputSeatsInnerStatusEnumSerializer();

class _$TripResponseDtoOutputSeatsInnerTypeEnumSerializer
    implements PrimitiveSerializer<TripResponseDtoOutputSeatsInnerTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SEAT': 'SEAT',
    'BED': 'BED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SEAT': 'SEAT',
    'BED': 'BED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    TripResponseDtoOutputSeatsInnerTypeEnum
  ];
  @override
  final String wireName = 'TripResponseDtoOutputSeatsInnerTypeEnum';

  @override
  Object serialize(Serializers serializers,
          TripResponseDtoOutputSeatsInnerTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  TripResponseDtoOutputSeatsInnerTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      TripResponseDtoOutputSeatsInnerTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$TripResponseDtoOutputSeatsInnerStatusEnumSerializer
    implements PrimitiveSerializer<TripResponseDtoOutputSeatsInnerStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'AVAILABLE': 'AVAILABLE',
    'HOLDING': 'HOLDING',
    'BOOKED': 'BOOKED',
    'CHECKED_IN': 'CHECKED_IN',
    'BLOCKED': 'BLOCKED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'AVAILABLE': 'AVAILABLE',
    'HOLDING': 'HOLDING',
    'BOOKED': 'BOOKED',
    'CHECKED_IN': 'CHECKED_IN',
    'BLOCKED': 'BLOCKED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    TripResponseDtoOutputSeatsInnerStatusEnum
  ];
  @override
  final String wireName = 'TripResponseDtoOutputSeatsInnerStatusEnum';

  @override
  Object serialize(Serializers serializers,
          TripResponseDtoOutputSeatsInnerStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  TripResponseDtoOutputSeatsInnerStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      TripResponseDtoOutputSeatsInnerStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$TripResponseDtoOutputSeatsInner
    extends TripResponseDtoOutputSeatsInner {
  @override
  final String code;
  @override
  final int deck;
  @override
  final int row;
  @override
  final int column;
  @override
  final TripResponseDtoOutputSeatsInnerTypeEnum type;
  @override
  final TripResponseDtoOutputSeatsInnerStatusEnum status;

  factory _$TripResponseDtoOutputSeatsInner(
          [void Function(TripResponseDtoOutputSeatsInnerBuilder)? updates]) =>
      (TripResponseDtoOutputSeatsInnerBuilder()..update(updates))._build();

  _$TripResponseDtoOutputSeatsInner._(
      {required this.code,
      required this.deck,
      required this.row,
      required this.column,
      required this.type,
      required this.status})
      : super._();
  @override
  TripResponseDtoOutputSeatsInner rebuild(
          void Function(TripResponseDtoOutputSeatsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TripResponseDtoOutputSeatsInnerBuilder toBuilder() =>
      TripResponseDtoOutputSeatsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TripResponseDtoOutputSeatsInner &&
        code == other.code &&
        deck == other.deck &&
        row == other.row &&
        column == other.column &&
        type == other.type &&
        status == other.status;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, deck.hashCode);
    _$hash = $jc(_$hash, row.hashCode);
    _$hash = $jc(_$hash, column.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TripResponseDtoOutputSeatsInner')
          ..add('code', code)
          ..add('deck', deck)
          ..add('row', row)
          ..add('column', column)
          ..add('type', type)
          ..add('status', status))
        .toString();
  }
}

class TripResponseDtoOutputSeatsInnerBuilder
    implements
        Builder<TripResponseDtoOutputSeatsInner,
            TripResponseDtoOutputSeatsInnerBuilder> {
  _$TripResponseDtoOutputSeatsInner? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  int? _deck;
  int? get deck => _$this._deck;
  set deck(int? deck) => _$this._deck = deck;

  int? _row;
  int? get row => _$this._row;
  set row(int? row) => _$this._row = row;

  int? _column;
  int? get column => _$this._column;
  set column(int? column) => _$this._column = column;

  TripResponseDtoOutputSeatsInnerTypeEnum? _type;
  TripResponseDtoOutputSeatsInnerTypeEnum? get type => _$this._type;
  set type(TripResponseDtoOutputSeatsInnerTypeEnum? type) =>
      _$this._type = type;

  TripResponseDtoOutputSeatsInnerStatusEnum? _status;
  TripResponseDtoOutputSeatsInnerStatusEnum? get status => _$this._status;
  set status(TripResponseDtoOutputSeatsInnerStatusEnum? status) =>
      _$this._status = status;

  TripResponseDtoOutputSeatsInnerBuilder() {
    TripResponseDtoOutputSeatsInner._defaults(this);
  }

  TripResponseDtoOutputSeatsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _deck = $v.deck;
      _row = $v.row;
      _column = $v.column;
      _type = $v.type;
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TripResponseDtoOutputSeatsInner other) {
    _$v = other as _$TripResponseDtoOutputSeatsInner;
  }

  @override
  void update(void Function(TripResponseDtoOutputSeatsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TripResponseDtoOutputSeatsInner build() => _build();

  _$TripResponseDtoOutputSeatsInner _build() {
    final _$result = _$v ??
        _$TripResponseDtoOutputSeatsInner._(
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'TripResponseDtoOutputSeatsInner', 'code'),
          deck: BuiltValueNullFieldError.checkNotNull(
              deck, r'TripResponseDtoOutputSeatsInner', 'deck'),
          row: BuiltValueNullFieldError.checkNotNull(
              row, r'TripResponseDtoOutputSeatsInner', 'row'),
          column: BuiltValueNullFieldError.checkNotNull(
              column, r'TripResponseDtoOutputSeatsInner', 'column'),
          type: BuiltValueNullFieldError.checkNotNull(
              type, r'TripResponseDtoOutputSeatsInner', 'type'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'TripResponseDtoOutputSeatsInner', 'status'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
