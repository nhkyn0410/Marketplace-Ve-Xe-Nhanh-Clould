// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_input_dto_seats_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const SeatMapInputDtoSeatsInnerTypeEnum
    _$seatMapInputDtoSeatsInnerTypeEnum_SEAT =
    const SeatMapInputDtoSeatsInnerTypeEnum._('SEAT');
const SeatMapInputDtoSeatsInnerTypeEnum
    _$seatMapInputDtoSeatsInnerTypeEnum_BED =
    const SeatMapInputDtoSeatsInnerTypeEnum._('BED');

SeatMapInputDtoSeatsInnerTypeEnum _$seatMapInputDtoSeatsInnerTypeEnumValueOf(
    String name) {
  switch (name) {
    case 'SEAT':
      return _$seatMapInputDtoSeatsInnerTypeEnum_SEAT;
    case 'BED':
      return _$seatMapInputDtoSeatsInnerTypeEnum_BED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SeatMapInputDtoSeatsInnerTypeEnum>
    _$seatMapInputDtoSeatsInnerTypeEnumValues = BuiltSet<
        SeatMapInputDtoSeatsInnerTypeEnum>(const <SeatMapInputDtoSeatsInnerTypeEnum>[
  _$seatMapInputDtoSeatsInnerTypeEnum_SEAT,
  _$seatMapInputDtoSeatsInnerTypeEnum_BED,
]);

Serializer<SeatMapInputDtoSeatsInnerTypeEnum>
    _$seatMapInputDtoSeatsInnerTypeEnumSerializer =
    _$SeatMapInputDtoSeatsInnerTypeEnumSerializer();

class _$SeatMapInputDtoSeatsInnerTypeEnumSerializer
    implements PrimitiveSerializer<SeatMapInputDtoSeatsInnerTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SEAT': 'SEAT',
    'BED': 'BED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SEAT': 'SEAT',
    'BED': 'BED',
  };

  @override
  final Iterable<Type> types = const <Type>[SeatMapInputDtoSeatsInnerTypeEnum];
  @override
  final String wireName = 'SeatMapInputDtoSeatsInnerTypeEnum';

  @override
  Object serialize(
          Serializers serializers, SeatMapInputDtoSeatsInnerTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  SeatMapInputDtoSeatsInnerTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      SeatMapInputDtoSeatsInnerTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$SeatMapInputDtoSeatsInner extends SeatMapInputDtoSeatsInner {
  @override
  final String code;
  @override
  final int deck;
  @override
  final int row;
  @override
  final int column;
  @override
  final SeatMapInputDtoSeatsInnerTypeEnum type;

  factory _$SeatMapInputDtoSeatsInner(
          [void Function(SeatMapInputDtoSeatsInnerBuilder)? updates]) =>
      (SeatMapInputDtoSeatsInnerBuilder()..update(updates))._build();

  _$SeatMapInputDtoSeatsInner._(
      {required this.code,
      required this.deck,
      required this.row,
      required this.column,
      required this.type})
      : super._();
  @override
  SeatMapInputDtoSeatsInner rebuild(
          void Function(SeatMapInputDtoSeatsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapInputDtoSeatsInnerBuilder toBuilder() =>
      SeatMapInputDtoSeatsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapInputDtoSeatsInner &&
        code == other.code &&
        deck == other.deck &&
        row == other.row &&
        column == other.column &&
        type == other.type;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, deck.hashCode);
    _$hash = $jc(_$hash, row.hashCode);
    _$hash = $jc(_$hash, column.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SeatMapInputDtoSeatsInner')
          ..add('code', code)
          ..add('deck', deck)
          ..add('row', row)
          ..add('column', column)
          ..add('type', type))
        .toString();
  }
}

class SeatMapInputDtoSeatsInnerBuilder
    implements
        Builder<SeatMapInputDtoSeatsInner, SeatMapInputDtoSeatsInnerBuilder> {
  _$SeatMapInputDtoSeatsInner? _$v;

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

  SeatMapInputDtoSeatsInnerTypeEnum? _type;
  SeatMapInputDtoSeatsInnerTypeEnum? get type => _$this._type;
  set type(SeatMapInputDtoSeatsInnerTypeEnum? type) => _$this._type = type;

  SeatMapInputDtoSeatsInnerBuilder() {
    SeatMapInputDtoSeatsInner._defaults(this);
  }

  SeatMapInputDtoSeatsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _deck = $v.deck;
      _row = $v.row;
      _column = $v.column;
      _type = $v.type;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapInputDtoSeatsInner other) {
    _$v = other as _$SeatMapInputDtoSeatsInner;
  }

  @override
  void update(void Function(SeatMapInputDtoSeatsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapInputDtoSeatsInner build() => _build();

  _$SeatMapInputDtoSeatsInner _build() {
    final _$result = _$v ??
        _$SeatMapInputDtoSeatsInner._(
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'SeatMapInputDtoSeatsInner', 'code'),
          deck: BuiltValueNullFieldError.checkNotNull(
              deck, r'SeatMapInputDtoSeatsInner', 'deck'),
          row: BuiltValueNullFieldError.checkNotNull(
              row, r'SeatMapInputDtoSeatsInner', 'row'),
          column: BuiltValueNullFieldError.checkNotNull(
              column, r'SeatMapInputDtoSeatsInner', 'column'),
          type: BuiltValueNullFieldError.checkNotNull(
              type, r'SeatMapInputDtoSeatsInner', 'type'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
